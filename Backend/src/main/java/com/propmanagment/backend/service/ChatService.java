package com.propmanagment.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.propmanagment.backend.model.ChatResponse;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ChatService {

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.model:gpt-4o-mini}")
    private String model;

    private final OkHttpClient client = new OkHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();

    public ChatResponse getAIResponse(String userMessage) {
        try {
            // Build the JSON request body
            String jsonBody = "{\n" +
                    "  \"model\": \"" + model + "\",\n" +
                    "  \"messages\": [\n" +
                    "    {\"role\": \"system\", \"content\": \"You are a helpful assistant.\"},\n" +
                    "    {\"role\": \"user\", \"content\": \"" + userMessage + "\"}\n" +
                    "  ],\n" +
                    "  \"max_tokens\": 500\n" +
                    "}";

            RequestBody body = RequestBody.create(
                    MediaType.parse("application/json"),
                    jsonBody
            );

            Request request = new Request.Builder()
                    .url("https://api.openai.com/v1/chat/completions")
                    .post(body)
                    .addHeader("Authorization", "Bearer " + apiKey)
                    .addHeader("Content-Type", "application/json")
                    .build();

            Response response = client.newCall(request).execute();

            if (!response.isSuccessful()) {
                return new ChatResponse("OpenAI request failed. HTTP code: " + response.code());
            }

            String resultJson = response.body().string();
            JsonNode root = mapper.readTree(resultJson);

            // OpenAI chat API returns text in choices[0].message.content
            String reply = root
                    .get("choices")
                    .get(0)
                    .get("message")
                    .get("content")
                    .asText();

            return new ChatResponse(reply);

        } catch (Exception e) {
            e.printStackTrace();
            return new ChatResponse("Error while contacting OpenAI: " + e.getMessage());
        }
    }
}