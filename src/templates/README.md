# Email Templates

This directory contains HTML email templates for Ketronics LTD's email communications.

## Available Templates

### Email Confirmation (`email-confirmation.html`)

A professional email confirmation template used when users sign up for an account.

#### Template Variables

- `{{ .ConfirmationURL }}` - The secure confirmation link that users should click to verify their email

#### Features

- **Responsive Design**: Works perfectly on desktop, mobile, and tablet devices
- **Modern UI**: Clean, professional design with gradient backgrounds and subtle shadows
- **Security Information**: Includes security notice about link expiration and what to do if the email was not requested
- **Company Branding**: Features Ketronics LTD branding with tagline
- **Accessibility**: Proper contrast ratios and semantic HTML structure
- **Email Client Compatibility**: Uses table-based layout and inline CSS for maximum compatibility

#### Usage

This template is designed to work with email service providers like SendGrid, Mailgun, or Supabase Auth. Simply replace `{{ .ConfirmationURL }}` with the actual confirmation URL when sending the email.

#### Design Elements

- **Header**: Gradient background with company logo and tagline
- **Content**: Clear messaging with prominent call-to-action button
- **Security Section**: Informational box about link security and expiration
- **Footer**: Company information, links, and copyright notice

#### Color Scheme

- Primary Blue: `#3b82f6` (for buttons and links)
- Dark Background: `#1e293b` (header gradient)
- Light Background: `#f8fafc` (body background)
- Text Colors: Various shades of gray for optimal readability

#### Technical Notes

- Uses table-based layout for email client compatibility
- Inline CSS styles (no external stylesheets)
- Responsive design with mobile-first approach
- Includes fallback text for non-HTML email clients
- Proper meta tags for email rendering

## Adding New Templates

When creating new email templates:

1. Use table-based layouts for maximum compatibility
2. Include inline CSS styles
3. Test across multiple email clients (Gmail, Outlook, Apple Mail, etc.)
4. Include fallback text for non-HTML clients
5. Use responsive design principles
6. Follow the existing branding and color scheme

## Testing

Before deploying email templates:

1. Test in various email clients
2. Check mobile responsiveness
3. Verify all links work correctly
4. Test with actual data to ensure proper rendering
5. Validate HTML structure

## Support

For questions about email templates, contact the development team or support@ketronics.co.ke.