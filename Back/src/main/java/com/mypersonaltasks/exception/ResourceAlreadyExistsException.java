package com.mypersonaltasks.exception;

public class ResourceAlreadyExistsException extends RuntimeException {

    public ResourceAlreadyExistsException(String message) {
        super(message);
    }

    public ResourceAlreadyExistsException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s already exists with %s: '%s'", resourceName, fieldName, fieldValue));
    }

    public static ResourceAlreadyExistsException create(String resourceName, String fieldName, Object fieldValue) {
        return new ResourceAlreadyExistsException(resourceName, fieldName, fieldValue);
    }
}
