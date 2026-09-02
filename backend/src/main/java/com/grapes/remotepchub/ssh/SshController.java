package com.grapes.remotepchub.ssh;

import com.grapes.remotepchub.auth.AuthService;
import com.grapes.remotepchub.pc.RemotePc;
import com.grapes.remotepchub.pc.RemotePcRepository;
import com.grapes.remotepchub.user.User;
import com.jcraft.jsch.ChannelSftp;
import com.jcraft.jsch.JSchException;
import com.jcraft.jsch.Session;
import com.jcraft.jsch.SftpException;
import lombok.AllArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@RestController
@RequestMapping("/api/v1/ssh")
@AllArgsConstructor
public class SshController {

    private final SshService sshService;
    private final SshSessionManager sessionManager;
    private final RemotePcRepository pcRepository;
    private final AuthService authService;

    @PostMapping("/connect/direct")
    public ResponseEntity<?> connectDirectly(@RequestBody SshConnectionRequest request) {
        User user = authService.getCurrentUser();
        try {
            Session session = sshService.connect(request.getUsername(), request.getPassword(), request.getHost(), request.getPort());
            sessionManager.addSession(user.getName(), session);
            return ResponseEntity.ok().body("Connection successful");
        } catch (JSchException e) {
            return ResponseEntity.badRequest().body("Connection failed: " + e.getMessage());
        }
    }

    @PostMapping("/connect/{pcId}")
    public ResponseEntity<?> connectWithPc(@PathVariable Long pcId, @RequestBody SshAuthRequest request) {
        User user = authService.getCurrentUser();

        RemotePc pc = pcRepository.findById(pcId).orElse(null);
        if (pc == null || !pc.getUser().getId().equals(user.getId())) {
            return ResponseEntity.notFound().build();
        }

        try {
            Session session = sshService.connectWithPc(pc, request.getPassword(), request.getPrivateKey());
            sessionManager.addSession(user.getName(), session);
            return ResponseEntity.ok().body("Connection successful");
        } catch (JSchException e) {
            return ResponseEntity.badRequest().body("Connection failed: " + e.getMessage());
        }
    }

    @GetMapping("/files")
    public ResponseEntity<?> listFiles(@RequestParam(defaultValue = ".") String path) {
        User user = authService.getCurrentUser();
        try {
            Session session = sessionManager.getActiveSession(user.getName());
            List<FileDto> files = sshService.listFiles(session, path);
            return ResponseEntity.ok(files);
        } catch (SftpException e) {
            if (e.id == ChannelSftp.SSH_FX_PERMISSION_DENIED) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Permission denied");
            }
            if (e.id == ChannelSftp.SSH_FX_NO_SUCH_FILE) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No such file or directory");
            }
            return ResponseEntity.internalServerError().body("Failed to list files: " + e.getMessage());
        } catch (JSchException e) {
            return ResponseEntity.internalServerError().body("Failed to list files: " + e.getMessage());
        }
    }

    @PostMapping("/files/create-file")
    public ResponseEntity<?> createFile(@RequestBody CreateRequest request) {
        User user = authService.getCurrentUser();
        try {
            Session session = sessionManager.getActiveSession(user.getName());
            sshService.createFile(session, request.getPath());
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (SftpException e) {
            if (e.id == ChannelSftp.SSH_FX_PERMISSION_DENIED) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Permission denied");
            }
            return ResponseEntity.internalServerError().body("Failed to create file: " + e.getMessage());
        } catch (JSchException e) {
            return ResponseEntity.internalServerError().body("Failed to create file: " + e.getMessage());
        }
    }

    @PostMapping("/files/create-directory")
    public ResponseEntity<?> createDirectory(@RequestBody CreateRequest request) {
        User user = authService.getCurrentUser();
        try {
            Session session = sessionManager.getActiveSession(user.getName());
            sshService.createDirectory(session, request.getPath());
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (SftpException e) {
            if (e.id == ChannelSftp.SSH_FX_PERMISSION_DENIED) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Permission denied");
            }
            return ResponseEntity.internalServerError().body("Failed to create directory: " + e.getMessage());
        } catch (JSchException e) {
            return ResponseEntity.internalServerError().body("Failed to create directory: " + e.getMessage());
        }
    }

    @DeleteMapping("/files")
    public ResponseEntity<?> delete(@RequestParam String path) {
        User user = authService.getCurrentUser();
        try {
            Session session = sessionManager.getActiveSession(user.getName());
            sshService.delete(session, path);
            return ResponseEntity.noContent().build();
        } catch (SftpException e) {
            if (e.id == ChannelSftp.SSH_FX_PERMISSION_DENIED) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Permission denied");
            }
            if (e.id == ChannelSftp.SSH_FX_NO_SUCH_FILE) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No such file or directory");
            }
            return ResponseEntity.internalServerError().body("Failed to delete: " + e.getMessage());
        } catch (JSchException e) {
            return ResponseEntity.internalServerError().body("Failed to delete: " + e.getMessage());
        }
    }

    @PutMapping("/files/permissions")
    public ResponseEntity<?> chmod(@RequestBody ChmodRequest request) {
        User user = authService.getCurrentUser();
        try {
            Session session = sessionManager.getActiveSession(user.getName());
            sshService.chmod(session, request.getPath(), request.getPermissions());
            return ResponseEntity.ok().build();
        } catch (SftpException e) {
            if (e.id == ChannelSftp.SSH_FX_PERMISSION_DENIED) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Permission denied");
            }
            if (e.id == ChannelSftp.SSH_FX_NO_SUCH_FILE) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No such file or directory");
            }
            return ResponseEntity.internalServerError().body("Failed to change permissions: " + e.getMessage());
        } catch (JSchException e) {
            return ResponseEntity.internalServerError().body("Failed to change permissions: " + e.getMessage());
        }
    }

    @GetMapping("/files/download")
    public ResponseEntity<?> downloadFile(@RequestParam String path) {
        User user = authService.getCurrentUser();
        try {
            Session session = sessionManager.getActiveSession(user.getName());
            InputStream inputStream = sshService.downloadFile(session, path);

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + path.substring(path.lastIndexOf("/") + 1));

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(new InputStreamResource(inputStream));
        } catch (SftpException e) {
            if (e.id == ChannelSftp.SSH_FX_PERMISSION_DENIED) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Permission denied");
            }
            if (e.id == ChannelSftp.SSH_FX_NO_SUCH_FILE) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No such file or directory");
            }
            return ResponseEntity.internalServerError().body("Failed to download file: " + e.getMessage());
        } catch (JSchException e) {
            return ResponseEntity.internalServerError().body("Failed to download file: " + e.getMessage());
        }
    }

    @PostMapping("/files/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file, @RequestParam("path") String path) {
        User user = authService.getCurrentUser();
        try {
            Session session = sessionManager.getActiveSession(user.getName());
            sshService.uploadFile(session, path, file);
            return ResponseEntity.ok().build();
        } catch (SftpException e) {
            if (e.id == ChannelSftp.SSH_FX_PERMISSION_DENIED) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Permission denied");
            }
            return ResponseEntity.internalServerError().body("Failed to upload file: " + e.getMessage());
        } catch (JSchException | IOException e) {
            return ResponseEntity.internalServerError().body("Failed to upload file: " + e.getMessage());
        }
    }

    @PostMapping("/disconnect")
    public ResponseEntity<Void> disconnect() {
        User user = authService.getCurrentUser();
        sessionManager.removeSession(user.getName());
        return ResponseEntity.noContent().build();
    }
}
