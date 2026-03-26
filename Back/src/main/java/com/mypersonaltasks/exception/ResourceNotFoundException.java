package com.mypersonaltasks.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s not found with %s: '%s'", resourceName, fieldName, fieldValue));
    }

    public static ResourceNotFoundException create(String resourceName, String fieldName, Object fieldValue) {
        return new ResourceNotFoundException(resourceName, fieldName, fieldValue);
    }
}
