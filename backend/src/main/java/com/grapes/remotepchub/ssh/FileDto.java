package com.grapes.remotepchub.ssh;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FileDto {
    private String name;
    private long size;
    private String permissions;
    @JsonProperty("isDirectory")
    private boolean isDirectory;
}
