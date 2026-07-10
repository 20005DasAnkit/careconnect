// Dtos/ChatRequestDto.cs
namespace HEALTHCARE.Dtos;

public class ChatMessageDto
{
    public string Role { get; set; } = "";     // "user" | "assistant"
    public string Content { get; set; } = "";
}

public class ChatRequestDto
{
    public string Message { get; set; } = "";
    public List<ChatMessageDto> History { get; set; } = new();
}