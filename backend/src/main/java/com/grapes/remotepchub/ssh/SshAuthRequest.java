package com.grapes.remotepchub.ssh;

import lombok.Data;

@Data
public class SshAuthRequest {
    private String password;
    private String privateKey;
}
