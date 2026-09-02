package com.grapes.remotepchub.ssh;

import com.grapes.remotepchub.pc.RemotePc;
import com.jcraft.jsch.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.Vector;

@Service
public class SshService {

    public Session connect(String username, String password, String host, int port) throws JSchException {
        JSch jsch = new JSch();
        Session session = jsch.getSession(username, host, port);
        session.setPassword(password);

        Properties config = new Properties();
        config.put("StrictHostKeyChecking", "no");
        session.setConfig(config);

        session.connect();
        return session;
    }

    public Session connectWithKey(String username, String privateKey, String host, int port) throws JSchException {
        JSch jsch = new JSch();
        jsch.addIdentity("user-key", privateKey.getBytes(), null, null);

        Session session = jsch.getSession(username, host, port);

        Properties config = new Properties();
        config.put("StrictHostKeyChecking", "no");
        session.setConfig(config);

        session.connect();
        return session;
    }

    public Session connectWithPc(RemotePc pc, String password, String privateKey) throws JSchException {
        if (privateKey != null && !privateKey.isEmpty()) {
            return connectWithKey(pc.getUsername(), privateKey, pc.getHost(), pc.getPort());
        } else {
            return connect(pc.getUsername(), password, pc.getHost(), pc.getPort());
        }
    }

    public void checkConnection(String username, String password, String host, int port, String privateKey) throws JSchException {
        Session session;
        if (privateKey != null && !privateKey.isEmpty()) {
            session = connectWithKey(username, privateKey, host, port);
        } else {
            session = connect(username, password, host, port);
        }
        disconnect(session);
    }

    public List<FileDto> listFiles(Session session, String path) throws JSchException, SftpException {
        ChannelSftp channelSftp = (ChannelSftp) session.openChannel("sftp");
        channelSftp.connect();

        Vector<ChannelSftp.LsEntry> fileList = channelSftp.ls(path);
        List<FileDto> files = new ArrayList<>();

        for (ChannelSftp.LsEntry entry : fileList) {
            if (!entry.getFilename().equals(".") && !entry.getFilename().equals("..")) {
                files.add(new FileDto(
                        entry.getFilename(),
                        entry.getAttrs().getSize(),
                        entry.getAttrs().getPermissionsString(),
                        entry.getAttrs().isDir()
                ));
            }
        }

        channelSftp.disconnect();
        return files;
    }

    public void createFile(Session session, String path) throws JSchException, SftpException {
        ChannelSftp channelSftp = (ChannelSftp) session.openChannel("sftp");
        channelSftp.connect();
        channelSftp.put(new ByteArrayInputStream("".getBytes()), path);
        channelSftp.disconnect();
    }

    public void createDirectory(Session session, String path) throws JSchException, SftpException {
        ChannelSftp channelSftp = (ChannelSftp) session.openChannel("sftp");
        channelSftp.connect();
        channelSftp.mkdir(path);
        channelSftp.disconnect();
    }

    public void delete(Session session, String path) throws JSchException, SftpException {
        ChannelSftp channelSftp = (ChannelSftp) session.openChannel("sftp");
        channelSftp.connect();

        SftpATTRS attrs = channelSftp.lstat(path);
        if (attrs.isDir()) {
            deleteDirectoryRecursive(channelSftp, path);
        } else {
            channelSftp.rm(path);
        }

        channelSftp.disconnect();
    }

    private void deleteDirectoryRecursive(ChannelSftp channelSftp, String path) throws SftpException {
        Vector<ChannelSftp.LsEntry> fileList = channelSftp.ls(path);
        for (ChannelSftp.LsEntry entry : fileList) {
            if (!entry.getFilename().equals(".") && !entry.getFilename().equals("..")) {
                String fullPath = path + "/" + entry.getFilename();
                if (entry.getAttrs().isDir()) {
                    deleteDirectoryRecursive(channelSftp, fullPath);
                } else {
                    channelSftp.rm(fullPath);
                }
            }
        }
        channelSftp.rmdir(path);
    }

    public void chmod(Session session, String path, int permissions) throws JSchException, SftpException {
        ChannelSftp channelSftp = (ChannelSftp) session.openChannel("sftp");
        channelSftp.connect();
        channelSftp.chmod(permissions, path);
        channelSftp.disconnect();
    }

    public InputStream downloadFile(Session session, String path) throws JSchException, SftpException {
        ChannelSftp channelSftp = (ChannelSftp) session.openChannel("sftp");
        channelSftp.connect();
        return channelSftp.get(path);
    }

    public void uploadFile(Session session, String path, MultipartFile file) throws JSchException, SftpException, IOException {
        ChannelSftp channelSftp = (ChannelSftp) session.openChannel("sftp");
        channelSftp.connect();
        channelSftp.put(file.getInputStream(), path);
        channelSftp.disconnect();
    }

    public void disconnect(Session session) {
        if (session != null && session.isConnected()) {
            session.disconnect();
        }
    }
}
