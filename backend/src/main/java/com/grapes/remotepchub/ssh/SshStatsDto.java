package com.grapes.remotepchub.ssh;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SshStatsDto {
    private String ping;
    private String storage;
}
