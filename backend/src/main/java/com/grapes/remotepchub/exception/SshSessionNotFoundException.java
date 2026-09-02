package com.grapes.remotepchub.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class SshSessionNotFoundException extends RuntimeException {
    public SshSessionNotFoundException(String message) {
        super(message);
    }
}
