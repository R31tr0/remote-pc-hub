package com.grapes.remotepchub.pc;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RemotePcDto {
    private Long id;
    private String alias;
    private String host;
    private int port;
    private String username;
}
