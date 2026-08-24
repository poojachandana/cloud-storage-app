package com.cloudstorage.dto;

import lombok.Data;

@Data
public class MoveRequest {
    // null = move to root ("My Drive")
    private Long folderId;
}
