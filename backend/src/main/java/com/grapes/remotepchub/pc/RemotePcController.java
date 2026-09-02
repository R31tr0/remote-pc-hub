package com.grapes.remotepchub.pc;

import com.grapes.remotepchub.auth.AuthService;
import com.grapes.remotepchub.ssh.SshService;
import com.grapes.remotepchub.user.User;
import com.jcraft.jsch.JSchException;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/pcs")
@AllArgsConstructor
public class RemotePcController {

    private final RemotePcRepository pcRepository;
    private final SshService sshService;
    private final AuthService authService;
    private final RemotePcMapper pcMapper;

    @PostMapping
    public ResponseEntity<?> addPc(@RequestBody CreatePcRequest request) {
        User user = authService.getCurrentUser();
        try {
            sshService.checkConnection(request.getUsername(), request.getPassword(), request.getHost(), request.getPort(), request.getPrivateKey());

            RemotePc pc = new RemotePc();
            pc.setAlias(request.getAlias());
            pc.setHost(request.getHost());
            pc.setPort(request.getPort());
            pc.setUsername(request.getUsername());
            pc.setUser(user);
            RemotePc savedPc = pcRepository.save(pc);

            URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                    .path("/{id}")
                    .buildAndExpand(savedPc.getId())
                    .toUri();

            return ResponseEntity.created(location).body(pcMapper.toDto(savedPc));
        } catch (JSchException e) {
            return ResponseEntity.badRequest().body("Connection failed: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<RemotePcDto>> getPcs() {
        User user = authService.getCurrentUser();
        List<RemotePc> pcs = pcRepository.findByUser(user);
        return ResponseEntity.ok(pcMapper.toDto(pcs));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePc(@PathVariable Long id) {
        User user = authService.getCurrentUser();
        pcRepository.deleteByIdAndUser(id, user);
        return ResponseEntity.noContent().build();
    }
}
