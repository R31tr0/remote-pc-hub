package com.grapes.remotepchub.ssh;

import com.grapes.remotepchub.auth.AuthService;
import com.grapes.remotepchub.auth.JwtService;
import com.grapes.remotepchub.pc.RemotePcRepository;
import com.grapes.remotepchub.user.User;
import com.jcraft.jsch.Session;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Collections;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class SshControllerTest {

    private MockMvc mockMvc;

    @Mock
    private SshService sshService;

    @Mock
    private SshSessionManager sessionManager;

    @Mock
    private RemotePcRepository pcRepository;

    @Mock
    private AuthService authService;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private SshController sshController;

    private User testUser;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(sshController).build();

        testUser = new User();
        testUser.setId(1L);
        testUser.setName("testuser");
        when(authService.getCurrentUser()).thenReturn(testUser);
    }

    @Test
    void listFiles_ShouldReturnListOfFiles() throws Exception {
        Session mockSession = mock(Session.class);
        FileDto fileDto = new FileDto("test.txt", 1024, "-rw-r--r--", false);

        when(sessionManager.getActiveSession(testUser.getName())).thenReturn(mockSession);
        when(sshService.listFiles(mockSession, ".")).thenReturn(Collections.singletonList(fileDto));

        mockMvc.perform(get("/api/v1/ssh/files")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("test.txt"));
    }

    @Test
    void disconnect_ShouldReturnNoContent() throws Exception {
        mockMvc.perform(post("/api/v1/ssh/disconnect")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(sessionManager).removeSession(testUser.getName());
    }
}