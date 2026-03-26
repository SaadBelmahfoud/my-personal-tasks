package com.mypersonaltasks.exception;

public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }

    public ForbiddenException() {
        super("You don't have permission to access this resource");
    }
}
