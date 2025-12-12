package com.propmanagment.backend.service;

import java.util.Properties;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${spring.mail.host}")
    private String mailHost;
    
    @Value("${spring.mail.port}")
    private int mailPort;
    
    @Value("${spring.mail.username}")
    private String mailUsername;
    
    @Value("${spring.mail.password}")
    private String mailPassword;

    // Reconfigure mail sender to handle SSL issues
    @PostConstruct
    public void configureMailSender() {
        if (mailSender instanceof JavaMailSenderImpl) {
            JavaMailSenderImpl sender = (JavaMailSenderImpl) mailSender;
            Properties props = sender.getJavaMailProperties();
            
            // Add properties to handle SSL certificate issues
            props.put("mail.smtp.ssl.trust", "*");
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.ssl.protocols", "TLSv1.2");
            props.put("mail.smtp.connectiontimeout", "5000");
            props.put("mail.smtp.timeout", "5000");
            props.put("mail.smtp.writetimeout", "5000");
        }
    }

    public void sendPasswordResetEmail(String to, String token) {
        String subject = "Password Reset Request";
        String resetUrl = "http://192.168.31.224:8080/api/auth/reset-password?token=" + token;

        String text = "You have requested to reset your password.\n\n" +
                      "Please click the link below to reset your password:\n" +
                      resetUrl + "\n\n" +
                      "This link will expire in 24 hours.\n\n" +
                      "If you did not request a password reset, please ignore this email.";
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        
        try {
            mailSender.send(message);
            log.info("Password reset email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}. Error details: {}", to, e.getMessage(), e);
        }
    }
    
    public void sendOtpEmail(String to, String otpCode) {
        String subject = "Password Reset OTP Code";
        
        String text = "You have requested to reset your password.\n\n" +
                      "Please use the following OTP code to verify your identity:\n\n" +
                      "OTP Code: " + otpCode + "\n\n" +
                      "This code will expire in 10 minutes.\n\n" +
                      "If you did not request a password reset, please ignore this email.";
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        
        try {
            mailSender.send(message);
            log.info("OTP email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send OTP email to: {}. Error details: {}", to, e.getMessage(), e);
        }
    }
    
    public void sendInquiryReplyEmail(String to, String subject, String message) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(to);
        mailMessage.setSubject(subject);
        mailMessage.setText(message);
        
        try {
            mailSender.send(mailMessage);
            log.info("Inquiry reply email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send inquiry reply email to: {}. Error details: {}", to, e.getMessage(), e);
        }
    }
}
