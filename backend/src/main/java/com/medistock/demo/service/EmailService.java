package com.medistock.demo.service;

import com.medistock.demo.entity.Medicine;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // =====================================================
    // MEDICINE ADDED EMAIL
    // =====================================================

    public void sendMedicineAddedEmail(
            String to,
            Medicine medicine
    ) {

        try {

            MimeMessage message =
                    mailSender.createMimeMessage();

            MimeMessageHelper helper =
                    new MimeMessageHelper(
                            message,
                            true,
                            "UTF-8"
                    );

            helper.setFrom(fromEmail);
            helper.setTo(to);

            helper.setSubject(
                    "💊 MediStock - New Medicine Added"
            );

            String html = buildMedicineAddedEmail(
                    medicine
            );

            helper.setText(
                    html,
                    true
            );

            mailSender.send(message);

            System.out.println(
                    "================================="
            );

            System.out.println(
                    "MEDICINE EMAIL SENT SUCCESSFULLY"
            );

            System.out.println(
                    "To : " + to
            );

            System.out.println(
                    "Medicine : " + medicine.getName()
            );

            System.out.println(
                    "================================="
            );

        } catch (MessagingException e) {

            System.err.println(
                    "EMAIL SENDING FAILED: "
                            + e.getMessage()
            );

        }
    }


    // =====================================================
    // HTML EMAIL DESIGN
    // =====================================================

    private String buildMedicineAddedEmail(
            Medicine medicine
    ) {

        String name =
                medicine.getName() != null
                        ? medicine.getName()
                        : "N/A";

        String category =
                medicine.getCategory() != null
                        ? medicine.getCategory()
                        : "N/A";

        String quantity =
                String.valueOf(
                        medicine.getQuantity()
                );

        String expiry =
                medicine.getExpiryDate() != null
                        ? medicine.getExpiryDate().toString()
                        : "N/A";


        return """

        <!DOCTYPE html>

        <html>

        <head>

            <meta charset="UTF-8">

            <meta name="viewport"
                  content="width=device-width,
                           initial-scale=1.0">

        </head>


        <body style="
            margin:0;
            padding:0;
            background:#f4f4f4;
            font-family:Arial,
                         Helvetica,
                         sans-serif;
        ">


        <div style="
            width:90%;
            max-width:820px;
            margin:20px auto;
            background:#ffffff;
            border-radius:14px;
            overflow:hidden;
        ">


            <!-- HEADER -->

            <div style="
                background:#96633E;
                color:white;
                padding:28px 30px;
                text-align:center;
            ">

                <div style="
                    font-size:30px;
                    font-weight:bold;
                ">

                    💊 MediStock Notification

                </div>

            </div>


            <!-- CONTENT -->

            <div style="
                padding:30px;
            ">


                <h2 style="
                    color:#96633E;
                    font-size:25px;
                    margin-top:0;
                ">

                    New Medicine Added

                </h2>


                <!-- MEDICINE TABLE -->

               <table style="
    width:100%%;
    border-collapse:collapse;
    margin-top:25px;
    font-size:16px;
">

                    <tr style="
                        background:#F5E6D0;
                        font-weight:bold;
                    ">

                        <td style="
                            padding:16px;
                            border:1px solid #ddd;
                            text-align:center;
                        ">
                            Medicine
                        </td>

                        <td style="
                            padding:16px;
                            border:1px solid #ddd;
                            text-align:center;
                        ">
                            Category
                        </td>

                        <td style="
                            padding:16px;
                            border:1px solid #ddd;
                            text-align:center;
                        ">
                            Quantity
                        </td>

                        <td style="
                            padding:16px;
                            border:1px solid #ddd;
                            text-align:center;
                        ">
                            Expiry Date
                        </td>

                    </tr>


                    <tr>

                      <td style="
    padding:16px;
    border:1px solid #ddd;
">
    {{MEDICINE_NAME}}
</td>

<td style="
    padding:16px;
    border:1px solid #ddd;
">
    {{CATEGORY}}
</td>

<td style="
    padding:16px;
    border:1px solid #ddd;
">
    {{QUANTITY}}
</td>

<td style="
    padding:16px;
    border:1px solid #ddd;
">
    {{EXPIRY}}
</td>

                    </tr>

                </ta ble>


                <!-- MESSAGE -->

                <div style="
                    margin-top:25px;
                    padding:20px;
                    background:#FFF2C7;
                    border-left:7px solid #FFA500;
                    border-radius:8px;
                    font-size:16px;
                    color:#333333;
                ">

                    Medicine has been successfully
                    added to the inventory.

                </div>


                <!-- FOOTER -->

                <div style="
                    margin-top:40px;
                    font-size:16px;
                    color:#333333;
                ">

                    Regards,

                    <br>

                    <strong>
                        MediStock Team
                    </strong>

                </div>


            </div>


        </div>


        </body>

        </html>

       """.replace("{{MEDICINE_NAME}}", name)
  .replace("{{CATEGORY}}", category)
  .replace("{{QUANTITY}}", quantity)
  .replace("{{EXPIRY}}", expiry);

    }
    // =====================================================
// FORGOT PASSWORD EMAIL
// =====================================================

public void sendForgotPasswordEmail(
        String to,
        String temporaryPassword
) {

    try {

        MimeMessage message =
                mailSender.createMimeMessage();

        MimeMessageHelper helper =
                new MimeMessageHelper(
                        message,
                        true,
                        "UTF-8"
                );

        helper.setFrom(fromEmail);
        helper.setTo(to);

        helper.setSubject(
                "MediStock - Password Reset"
        );

        String html = """
                <!DOCTYPE html>
                <html>
                <body style="
                    margin:0;
                    padding:30px;
                    background:#f4f6f8;
                    font-family:Arial, Helvetica, sans-serif;
                ">

                    <div style="
                        max-width:600px;
                        margin:auto;
                        background:white;
                        border-radius:12px;
                        padding:35px;
                    ">

                        <h1 style="
                            color:#174ea6;
                            text-align:center;
                        ">
                            💊 MediStock
                        </h1>

                        <h2 style="color:#333;">
                            Password Reset
                        </h2>

                        <p>
                            Your MediStock password has been reset.
                        </p>

                        <p>
                            Your new temporary password is:
                        </p>

                        <div style="
                            background:#eef4ff;
                            padding:18px;
                            text-align:center;
                            border-radius:8px;
                            font-size:24px;
                            font-weight:bold;
                            color:#174ea6;
                        ">
                            %s
                        </div>

                        <p style="
                            margin-top:25px;
                            color:#555;
                        ">
                            Please use this password to log in.
                        </p>

                        <p style="color:#777;">
                            Regards,<br>
                            <strong>MediStock Team</strong>
                        </p>

                    </div>

                </body>
                </html>
                """.formatted(temporaryPassword);

        helper.setText(html, true);

        mailSender.send(message);

        System.out.println(
                "PASSWORD RESET EMAIL SENT TO: " + to
        );

    } catch (MessagingException e) {

        System.err.println(
                "PASSWORD RESET EMAIL FAILED: "
                        + e.getMessage()
        );

        throw new RuntimeException(
                "Unable to send password reset email"
        );
    }
}
}
