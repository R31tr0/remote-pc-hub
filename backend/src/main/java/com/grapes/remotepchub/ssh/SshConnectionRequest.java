package com.grapes.remotepchub.ssh;

import lombok.Data;

@Data
public class SshConnectionRequest {
    private String host;
    private int port;
    private String username;
    private String password;
}
