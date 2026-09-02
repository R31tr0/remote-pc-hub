package com.grapes.remotepchub.ssh;

import com.grapes.remotepchub.exception.SshSessionNotFoundException;
import com.jcraft.jsch.Session;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SshSessionManager {

    private final Map<String, Session> sessions = new ConcurrentHashMap<>();

    public void addSession(String userId, Session session) {
        sessions.put(userId, session);
    }

    public Session getSession(String userId) {
        return sessions.get(userId);
    }

    public Session getActiveSession(String username) {
        Session session = getSession(username);
        if (session == null || !session.isConnected()) {
            throw new SshSessionNotFoundException("No active SSH session for user: " + username);
        }
        return session;
    }

    public void removeSession(String userId) {
        Session session = sessions.remove(userId);
        if (session != null && session.isConnected()) {
            session.disconnect();
        }
    }
}
