using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using HEALTHCARE.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace HEALTHCARE.Controllers;

[ApiController]
[Route("api/ai")]
public class AiController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly HttpClient _httpClient;

    // Known actions the frontend knows how to navigate to.
    private static readonly HashSet<string> ValidActions = new()
    {
        "appointments", "doctors", "ambulance", "prescriptions",
        "medicine", "profile", "wallet", "dashboard", "orders", "none"
    };

    public AiController(IConfiguration config)
    {
        _config = config;
        _httpClient = new HttpClient();
    }

    private const string SystemPrompt = """
        You are CareConnect AI Assistant, embedded inside the CareConnect healthcare app.

        Your job is to have a natural, helpful conversation with the patient, and only
        navigate them to a page inside the app AFTER they clearly agree to it.

        ─── HOW TO RESPOND ───

        1. If the user asks about booking a doctor, explain briefly how booking works
           (browse doctors → open profile → pick a slot → confirm), then ask:
           "Would you like me to open the Doctors page?"

        2. If the user asks about booking an ambulance, explain briefly (pickup location →
           destination → choose nearby ambulance → confirm), then ask:
           "Would you like me to open the Ambulance page?"

        3. If the user describes a symptom (fever, headache, skin issue, stomach pain, eye
           pain, pregnancy-related concern, etc.), respond like a caring assistant:
           - Acknowledge how they feel.
           - Suggest 2-3 common over-the-counter options ONLY for mild, common symptoms
             (fever, headache, cold). NEVER prescribe doses or brand-specific dosages.
           - Recommend a relevant doctor specialization if applicable
             (e.g. skin issue → Dermatologist, stomach pain → Gastroenterologist,
             eye pain → Ophthalmologist, pregnancy → Gynecologist).
           - Then ask ONE relevant follow-up question, such as:
             "Would you like me to open the Medicine Store?" or
             "Would you like me to open the Doctors page so you can book a
             {specialization}?"

        4. If the symptom sounds serious or an emergency (chest pain, stroke symptoms,
           severe bleeding, breathing difficulty, unconsciousness, severe injury), tell
           them to seek emergency care immediately, and ask:
           "Would you like me to open the Ambulance booking page?"

        5. If the user asks to see their appointments, prescriptions, wallet, profile,
           dashboard, or orders, just ask for confirmation directly, e.g.
           "Would you like me to open your Appointments?"

        6. If the user replies affirmatively (e.g. "yes", "sure", "ok", "please do") to a
           question YOU asked in the previous turn, treat that as confirmation for
           whatever page you last offered to open.

        7. If the user says no, or asks something unrelated, do not navigate anywhere.

        8. Never prescribe medicines with exact dosages, never confirm a diagnosis, and
           always recommend consulting a doctor for anything beyond mild, common symptoms.

        ─── OUTPUT FORMAT (VERY IMPORTANT) ───

        Always end your reply with a line in exactly this format, on its own line:

        ACTION: <one of: appointments, doctors, ambulance, prescriptions, medicine,
        profile, wallet, dashboard, orders, none>

        Use ACTION: none unless the user has just confirmed they want a page opened in
        THIS turn. The ACTION line itself must never be shown to the user in your
        conversational reply — it is a machine-readable instruction appended at the end.
        """;

    [HttpPost("chat")]
    public async Task<IActionResult> Chat([FromBody] ChatRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Message))
            return BadRequest(new { message = "Message is required." });

        var apiKey = _config["Groq:ApiKey"];

        var messages = new List<object>
        {
            new { role = "system", content = SystemPrompt }
        };

        // Replay prior turns so the AI has context for "yes" style confirmations.
        foreach (var h in dto.History)
        {
            var role = h.Role == "assistant" ? "assistant" : "user";
            messages.Add(new { role, content = h.Content });
        }

        messages.Add(new { role = "user", content = dto.Message });

        var body = new
        {
            model = "llama-3.3-70b-versatile",
            messages,
            temperature = 0.4,
            max_tokens = 500
        };

        var request = new HttpRequestMessage(
            HttpMethod.Post,
            "https://api.groq.com/openai/v1/chat/completions");

        request.Headers.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);

        request.Content = new StringContent(
            JsonSerializer.Serialize(body),
            Encoding.UTF8,
            "application/json");

        var response = await _httpClient.SendAsync(request);
        var responseText = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            return BadRequest(new { message = "Groq API Error", error = responseText });
        }

        using var doc = JsonDocument.Parse(responseText);

        var rawReply = doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString() ?? "";

        var (cleanReply, action) = ExtractAction(rawReply);

        return Ok(new AiResponseDto
        {
            Reply = cleanReply,
            Action = action
        });
    }

    private static (string reply, string action) ExtractAction(string rawReply)
    {
        var match = Regex.Match(
            rawReply,
            @"ACTION:\s*([a-zA-Z]+)\s*$",
            RegexOptions.IgnoreCase | RegexOptions.Multiline);

        var action = "none";
        if (match.Success)
        {
            var candidate = match.Groups[1].Value.Trim().ToLower();
            if (ValidActions.Contains(candidate))
                action = candidate;
        }

        // Strip the ACTION line (and any trailing whitespace/newlines before it)
        // so it's never shown to the user.
        var cleanReply = Regex.Replace(
            rawReply,
            @"\s*ACTION:\s*[a-zA-Z]+\s*$",
            "",
            RegexOptions.IgnoreCase | RegexOptions.Multiline).Trim();

        return (cleanReply, action);
    }
}