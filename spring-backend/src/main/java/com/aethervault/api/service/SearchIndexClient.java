package com.aethervault.api.service;

import com.aethervault.api.model.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClient;

@Service
public class SearchIndexClient {
    private static final Logger log = LoggerFactory.getLogger(SearchIndexClient.class);
    private final RestClient client;

    public SearchIndexClient(@Value("${node.backend-url:http://localhost:5000}") String nodeBackendUrl) {
        this.client = RestClient.builder().baseUrl(nodeBackendUrl).build();
    }

    public void indexDocument(Document document) {
        try {
            client.post()
                    .uri("/internal/documents/index")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new IndexRequest(
                            document.getId(),
                            document.getTitle(),
                            document.getDescription(),
                            document.getCategory() == null ? null : document.getCategory().getName()
                    ))
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException ignored) {
            log.warn("Search service unavailable while indexing document id={}", document.getId());
        }
    }

    public void deleteDocument(Long documentId) {
        try {
            client.delete()
                    .uri("/internal/documents/{id}", documentId)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException ignored) {
            log.warn("Search service unavailable while deleting document id={}", documentId);
        }
    }

    public record IndexRequest(Long documentId, String title, String description, String category) {}
}
