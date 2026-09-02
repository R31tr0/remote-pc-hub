package com.grapes.remotepchub.ssh;

import lombok.Data;

@Data
public class ChmodRequest {
    private String path;
    private int permissions;
}
