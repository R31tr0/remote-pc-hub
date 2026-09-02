package com.grapes.remotepchub.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterUserRequest {
    @NotBlank(message = "Username is required")
    @Size(max = 255, message = "Username must be less than 255 characters")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 55, message = "Password must be between 6 to 55 characters long.")
    private String password;
}

