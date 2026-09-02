package com.grapes.remotepchub.pc;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CreatePcRequest {
    private String alias;
    private String host;
    private int port;
    private String username;
    private String password;
    private String privateKey;
}
