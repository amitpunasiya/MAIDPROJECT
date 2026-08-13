import { Booking } from '../../models/booking.model.js';
import { Customer } from '../../models/customer.model.js';
import { ApiError } from '../../utils/ApiError.js';

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: Date;
  bookingId: string;
  customerName: string;
  customerPhone?: string;
  providerName: string;
  providerGstNo?: string;
  serviceType: string;
  basePrice: number;
  discount: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  totalGst: number;
  grandTotal: number;
  paymentMode: string;
  paymentStatus: string;
}

export class InvoiceService {
  async generateInvoiceData(bookingId: string): Promise<InvoiceData> {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw ApiError.notFound('Booking not found');

    const customer = await Customer.findById(booking.customerId).populate('userId');
    const customerUser = (customer as any)?.userId;

    const basePrice = booking.pricing?.baseAmount ?? 500;
    const discount = booking.pricing?.discountAmount ?? 0;
    const taxableAmount = Math.max(0, basePrice - discount);
    const cgst = Math.round((taxableAmount * 0.09) * 100) / 100;
    const sgst = Math.round((taxableAmount * 0.09) * 100) / 100;
    const totalGst = cgst + sgst;
    const grandTotal = booking.pricing?.totalAmount ?? (taxableAmount + totalGst);

    const invoiceNumber = `INV-${bookingId.substring(bookingId.length - 8).toUpperCase()}`;

    return {
      invoiceNumber,
      invoiceDate: booking.createdAt,
      bookingId: booking._id.toString(),
      customerName: customerUser?.name || 'Valued Customer',
      customerPhone: customerUser?.phone,
      providerName: 'Assigned Service Provider',
      providerGstNo: '27AAAAA0000A1Z5',
      serviceType: booking.serviceType,
      basePrice,
      discount,
      taxableAmount,
      cgst,
      sgst,
      totalGst,
      grandTotal,
      paymentMode: 'Online',
      paymentStatus: booking.status,
    };
  }

  async generateInvoiceHtml(bookingId: string): Promise<string> {
    const data = await this.generateInvoiceData(bookingId);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Invoice - ${data.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #6366f1; padding-bottom: 15px; }
          .title { font-size: 24px; font-weight: bold; color: #4f46e5; }
          .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .table th, .table td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
          .table th { background-color: #f9fafb; }
          .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; color: #4f46e5; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">MAID & COOK ENTERPRISE</div>
            <p>GSTIN: 27AAAAA0000A1Z5 | SAC Code: 9988</p>
          </div>
          <div>
            <h3>TAX INVOICE</h3>
            <p>Invoice No: <strong>${data.invoiceNumber}</strong></p>
            <p>Date: ${new Date(data.invoiceDate).toLocaleDateString()}</p>
          </div>
        </div>

        <div style="margin-top: 20px;">
          <p><strong>Billed To:</strong> ${data.customerName} (${data.customerPhone || 'N/A'})</p>
          <p><strong>Service Provider:</strong> ${data.providerName} (GST: ${data.providerGstNo})</p>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Base Amount (₹)</th>
              <th>Discount (₹)</th>
              <th>Taxable Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${data.serviceType} Booking Service</td>
              <td>${data.basePrice.toFixed(2)}</td>
              <td>${data.discount.toFixed(2)}</td>
              <td>${data.taxableAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <table class="table" style="width: 50%; float: right; margin-top: 15px;">
          <tr>
            <td>CGST (9%)</td>
            <td>₹${data.cgst.toFixed(2)}</td>
          </tr>
          <tr>
            <td>SGST (9%)</td>
            <td>₹${data.sgst.toFixed(2)}</td>
          </tr>
          <tr>
            <th>Total GST (18%)</th>
            <th>₹${data.totalGst.toFixed(2)}</th>
          </tr>
        </table>
        <div style="clear: both;"></div>

        <div class="total">
          Grand Total: ₹${data.grandTotal.toFixed(2)}
        </div>
      </body>
      </html>
    `;
  }
}

export const invoiceService = new InvoiceService();
