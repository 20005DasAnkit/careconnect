using HEALTHCARE.DTOs;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace HEALTHCARE.Services;

public class MedicineBillingPdfService
{
    private static readonly string Green = "#2D5016";
    private static readonly string GreenLight = "#EBF2E3";
    private static readonly string Terra = "#C4622D";
    private static readonly string Ink = "#16332B";
    private static readonly string Cream = "#F5F0E8";
    private static readonly string Border = "#E2DACE";
    private static readonly string MutedText = "#6B7280";
    private static readonly string RowAlt = "#FAF8F3";

    public byte[] Generate(MedicineInvoiceDto invoice)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(0);
                page.MarginBottom(55);

                page.DefaultTextStyle(x => x
                    .FontFamily("Helvetica")
                    .FontSize(10)
                    .FontColor(Ink));

                page.Content().Column(col =>
                {
                    // ===========================
                    // HEADER
                    // ===========================
                    col.Item()
                        .Background(Green)
                        .Padding(20)
                        .Row(row =>
                        {
                            row.RelativeItem()
                                .Text("CareConnect")
                                .FontSize(20)
                                .Bold()
                                .FontColor(Colors.White);

                            row.ConstantItem(220)
                                .AlignRight()
                                .Text("MEDICINE INVOICE")
                                .FontSize(13)
                                .Bold()
                                .FontColor(Colors.White)
                                .LetterSpacing(0.05f);
                        });

                    col.Item().Padding(28).Column(body =>
                    {
                        // ===========================
                        // Invoice Info
                        // ===========================
                        body.Item().Row(row =>
                        {
                            row.RelativeItem().Column(c =>
                            {
                                c.Item()
                                    .Text("Invoice No.")
                                    .FontSize(8)
                                    .Bold()
                                    .FontColor(MutedText);

                                c.Item()
                                    .PaddingTop(3)
                                    .Text(invoice.InvoiceNumber)
                                    .FontSize(11)
                                    .Bold();
                            });

                            row.RelativeItem().Column(c =>
                            {
                                c.Item()
                                    .Text("Order Date")
                                    .FontSize(8)
                                    .Bold()
                                    .FontColor(MutedText);

                                c.Item()
                                    .PaddingTop(3)
                                    .Text(invoice.OrderDate.ToString("dd MMM yyyy"))
                                    .FontSize(11)
                                    .Bold();
                            });

                            row.RelativeItem().Column(c =>
                            {
                                c.Item()
                                    .Text("Status")
                                    .FontSize(8)
                                    .Bold()
                                    .FontColor(MutedText);

                                c.Item()
                                    .PaddingTop(3)
                                    .Text(invoice.DeliveryStatus)
                                    .FontSize(11)
                                    .Bold()
                                    .FontColor(
                                        invoice.DeliveryStatus == "Delivered"
                                            ? Green
                                            : Terra);
                            });
                        });

                        body.Item()
                            .PaddingVertical(16)
                            .LineHorizontal(1)
                            .LineColor(Border);

                        // ===========================
                        // Customer + Delivery
                        // ===========================
                        body.Item().Row(row =>
                        {
                            row.RelativeItem().Column(c =>
                            {
                                c.Item()
                                    .Text("BILLED TO")
                                    .FontSize(8)
                                    .Bold()
                                    .FontColor(MutedText);

                                c.Item()
                                    .PaddingTop(3)
                                    .Text(invoice.CustomerName)
                                    .FontSize(12)
                                    .Bold();

                                c.Item()
                                    .Text($"Phone : {invoice.CustomerPhone}")
                                    .FontSize(9)
                                    .FontColor(MutedText);

                                c.Item()
                                    .Text($"Email : {invoice.CustomerEmail}")
                                    .FontSize(9)
                                    .FontColor(MutedText);

                                c.Item()
                                    .Text($"Address : {invoice.CustomerAddress}")
                                    .FontSize(9)
                                    .FontColor(MutedText);
                            });

                            row.RelativeItem().Column(c =>
                            {
                                c.Item()
                                    .AlignRight()
                                    .Text("ORDER DETAILS")
                                    .FontSize(8)
                                    .Bold()
                                    .FontColor(MutedText);

                                c.Item()
                                    .AlignRight()
                                    .PaddingTop(3)
                                    .Text($"Order #{invoice.OrderId}")
                                    .FontSize(12)
                                    .Bold();

                                c.Item()
                                    .AlignRight()
                                    .Text($"Payment : {invoice.PaymentMethod}")
                                    .FontSize(9)
                                    .FontColor(MutedText);

                                c.Item()
                                    .AlignRight()
                                    .Text($"Status : {invoice.PaymentStatus}")
                                    .FontSize(9)
                                    .FontColor(MutedText);

                                c.Item()
                                    .AlignRight()
                                    .Text($"Transaction : {invoice.TransactionId ?? "-"}")
                                    .FontSize(9)
                                    .FontColor(MutedText);

                                c.Item()
                                    .AlignRight()
                                    .Text(
                                        $"Delivery : {(invoice.DeliveryDate.HasValue ? invoice.DeliveryDate.Value.ToString("dd MMM yyyy") : "-")}")
                                    .FontSize(9)
                                    .FontColor(MutedText);
                            });
                        });

                        body.Item()
                            .PaddingVertical(16)
                            .LineHorizontal(1)
                            .LineColor(Border);

                        // ===========================
                        // NEXT:
                        // Medicine Table
                        // ===========================
                                                body.Item()
                            .Text("Medicines")
                            .FontSize(13)
                            .Bold()
                            .FontColor(Green);

                        body.Item()
                            .PaddingTop(10)
                            .Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.RelativeColumn(5);
                                    columns.RelativeColumn(1);
                                    columns.RelativeColumn(2);
                                    columns.RelativeColumn(2);
                                });

                                table.Header(header =>
                                {
                                    header.Cell().Background(Green).Padding(8)
                                        .Text("MEDICINE")
                                        .FontSize(8)
                                        .Bold()
                                        .FontColor(Colors.White);

                                    header.Cell().Background(Green).Padding(8).AlignCenter()
                                        .Text("QTY")
                                        .FontSize(8)
                                        .Bold()
                                        .FontColor(Colors.White);

                                    header.Cell().Background(Green).Padding(8).AlignRight()
                                        .Text("PRICE")
                                        .FontSize(8)
                                        .Bold()
                                        .FontColor(Colors.White);

                                    header.Cell().Background(Green).Padding(8).AlignRight()
                                        .Text("TOTAL")
                                        .FontSize(8)
                                        .Bold()
                                        .FontColor(Colors.White);
                                });

                                int row = 0;

                                foreach (var item in invoice.Items)
                                {
                                    var bg = row++ % 2 == 0 ? "#FFFFFF" : RowAlt;

                                    table.Cell().Background(bg)
                                        .BorderBottom(1)
                                        .BorderColor(Border)
                                        .Padding(8)
                                        .Text(item.MedicineName);

                                    table.Cell().Background(bg)
                                        .BorderBottom(1)
                                        .BorderColor(Border)
                                        .Padding(8)
                                        .AlignCenter()
                                        .Text(item.Quantity.ToString());

                                    table.Cell().Background(bg)
                                        .BorderBottom(1)
                                        .BorderColor(Border)
                                        .Padding(8)
                                        .AlignRight()
                                        .Text($"₹{item.UnitPrice:0.00}");

                                    table.Cell().Background(bg)
                                        .BorderBottom(1)
                                        .BorderColor(Border)
                                        .Padding(8)
                                        .AlignRight()
                                        .Text($"₹{item.TotalPrice:0.00}")
                                        .Bold();
                                }
                            });

                        body.Item()
                            .PaddingTop(18)
                            .AlignRight()
                            .Width(270)
                            .Column(summary =>
                            {
                                summary.Item().Row(row =>
                                {
                                    row.RelativeItem().Text("Subtotal");
                                    row.ConstantItem(90).AlignRight()
                                        .Text($"₹{invoice.SubTotal:0.00}");
                                });

                                summary.Item().PaddingTop(5).Row(row =>
                                {
                                    row.RelativeItem().Text("Delivery Charge");
                                    row.ConstantItem(90).AlignRight()
                                        .Text($"₹{invoice.DeliveryCharge:0.00}");
                                });

                                summary.Item().PaddingTop(5).Row(row =>
                                {
                                    row.RelativeItem().Text("Discount");
                                    row.ConstantItem(90).AlignRight()
                                        .Text($"- ₹{invoice.Discount:0.00}")
                                        .FontColor(Terra);
                                });

                                summary.Item()
                                    .PaddingTop(10)
                                    .Background(GreenLight)
                                    .Padding(12)
                                    .Row(row =>
                                    {
                                        row.RelativeItem()
                                            .Text("GRAND TOTAL")
                                            .Bold()
                                            .FontColor(Green);

                                        row.ConstantItem(90)
                                            .AlignRight()
                                            .Text($"₹{invoice.TotalAmount:0.00}")
                                            .Bold()
                                            .FontSize(13)
                                            .FontColor(Green);
                                    });
                            });

                        body.Item()
                            .PaddingTop(25)
                            .Background(Cream)
                            .Padding(12)
                            .Column(c =>
                            {
                                c.Item()
                                    .Text("NOTE")
                                    .FontSize(8)
                                    .Bold()
                                    .FontColor(MutedText);

                                c.Item()
                                    .PaddingTop(3)
                                    .Text("Thank you for choosing CareConnect. This invoice is computer generated and does not require a signature.")
                                    .FontSize(8.5f)
                                    .FontColor(MutedText)
                                    .LineHeight(1.4f);
                            });
                    });
                });

                page.Footer()
                    .Column(column =>
                    {
                        column.Item()
                            .LineHorizontal(1)
                            .LineColor(Border);

                        column.Item()
                            .Background(Cream)
                            .PaddingVertical(12)
                            .PaddingHorizontal(28)
                            .Row(row =>
                            {
                                row.RelativeItem()
                                    .Text($"Generated by CareConnect · {DateTime.Now:dd MMM yyyy}")
                                    .FontSize(7.5f)
                                    .FontColor(MutedText);

                                row.RelativeItem()
                                    .AlignRight()
                                    .Text("Invoice")
                                    .FontSize(7.5f)
                                    .FontColor(MutedText);
                            });
                    });
            });
        });

        return document.GeneratePdf();
    }
}