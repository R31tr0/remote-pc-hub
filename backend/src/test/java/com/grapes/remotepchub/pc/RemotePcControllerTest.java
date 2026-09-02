package com.grapes.remotepchub.pc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.grapes.remotepchub.auth.AuthService;
import com.grapes.remotepchub.ssh.SshService;
import com.grapes.remotepchub.user.User;
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
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class RemotePcControllerTest {

    private MockMvc mockMvc;

    @Mock
    private RemotePcRepository pcRepository;

    @Mock
    private SshService sshService;

    @Mock
    private AuthService authService;

    @Mock
    private RemotePcMapper pcMapper;

    @InjectMocks
    private RemotePcController remotePcController;

    private ObjectMapper objectMapper = new ObjectMapper();

    private User testUser;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(remotePcController).build();

        testUser = new User();
        testUser.setId(1L);
        testUser.setName("testuser");
        when(authService.getCurrentUser()).thenReturn(testUser);
    }

    @Test
    void addPc_ShouldReturnCreated_WhenConnectionIsSuccessful() throws Exception {
        CreatePcRequest request = new CreatePcRequest("alias", "host", 22, "user", "pass", null);

        RemotePc savedPc = new RemotePc();
        savedPc.setId(1L);
        savedPc.setAlias(request.getAlias());
        savedPc.setUser(testUser);

        when(pcRepository.save(any(RemotePc.class))).thenReturn(savedPc);
        when(pcMapper.toDto(any(RemotePc.class))).thenReturn(new RemotePcDto(1L, "alias", "host", 22, "user"));

        mockMvc.perform(post("/api/v1/pcs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.alias").value(request.getAlias()))
                .andExpect(header().string("Location", "http://localhost/api/v1/pcs/1"));
    }

    @Test
    void getPcs_ShouldReturnListOfPcs() throws Exception {
        RemotePc pc = new RemotePc();
        pc.setId(1L);
        pc.setAlias("test-pc");
        pc.setUser(testUser);

        when(pcRepository.findByUser(testUser)).thenReturn(Collections.singletonList(pc));
        when(pcMapper.toDto(any(List.class))).thenReturn(Collections.singletonList(new RemotePcDto(1L, "test-pc", "host", 22, "user")));

        mockMvc.perform(get("/api/v1/pcs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].alias").value("test-pc"));
    }

    @Test
    void deletePc_ShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/v1/pcs/1"))
                .andExpect(status().isNoContent());
    }
}
