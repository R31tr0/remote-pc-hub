package com.grapes.remotepchub.ssh;

import com.grapes.remotepchub.exception.SshSessionNotFoundException;
import com.jcraft.jsch.Session;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SshSessionManagerTest {

    private SshSessionManager sessionManager;
    private Session mockSession;

    @BeforeEach
    void setUp() {
        sessionManager = new SshSessionManager();
        mockSession = mock(Session.class);
    }

    @Test
    void getActiveSession_ShouldReturnSession_WhenSessionIsActive() {
        when(mockSession.isConnected()).thenReturn(true);
        sessionManager.addSession("testuser", mockSession);

        Session activeSession = sessionManager.getActiveSession("testuser");

        assertNotNull(activeSession);
        assertEquals(mockSession, activeSession);
    }

    @Test
    void getActiveSession_ShouldThrowException_WhenSessionIsNotConnected() {
        when(mockSession.isConnected()).thenReturn(false);
        sessionManager.addSession("testuser", mockSession);

        assertThrows(SshSessionNotFoundException.class, () -> {
            sessionManager.getActiveSession("testuser");
        });
    }

    @Test
    void getActiveSession_ShouldThrowException_WhenSessionNotFound() {
        assertThrows(SshSessionNotFoundException.class, () -> {
            sessionManager.getActiveSession("nonexistentuser");
        });
    }
}
