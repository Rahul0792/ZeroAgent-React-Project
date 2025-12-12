package com.propmanagment.backend.controller;

import com.propmanagment.backend.model.ChatResponse;
import com.propmanagment.backend.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin("*")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping
    public ChatResponse askAI(@RequestBody Map<String, String> body) throws Exception {
        String message = body.get("message");
        return chatService.getAIResponse(message);
    }
}