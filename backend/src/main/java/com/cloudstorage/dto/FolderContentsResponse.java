package com.cloudstorage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class FolderContentsResponse {
    private List<FolderResponse> folders;
    private List<FileResponse> files;
}
