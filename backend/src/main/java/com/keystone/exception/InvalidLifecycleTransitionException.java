package com.keystone.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class InvalidLifecycleTransitionException extends RuntimeException {
    public InvalidLifecycleTransitionException(String message) {
        super(message);
    }
}
