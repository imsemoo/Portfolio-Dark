<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST["name"];
    $email = $_POST["email"];
    $message = $_POST["message"];

    // You can add additional validation here if needed
    // For example, check if fields are not empty, validate email format, etc.

    $to = "en.developer2@gmail.com";
    $subject = "Contact Form Submission from " . $name;
    $headers = "From: " . $email . "\r\n";
    $headers .= "Reply-To: " . $email . "\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

    $message_content = "
    <html>
    <body>
    <h2>Contact Form Submission</h2>
    <p><strong>Name:</strong> {$name}</p>
    <p><strong>Email:</strong> {$email}</p>
    <p><strong>Message:</strong></p>
    <p>{$message}</p>
    </body>
    </html>
    ";

    if (mail($to, $subject, $message_content, $headers)) {
        echo "Thank you for your message. It has been sent successfully.";
    } else {
        echo "Error: Unable to send the email. Please try again later.";
    }
}
?>
