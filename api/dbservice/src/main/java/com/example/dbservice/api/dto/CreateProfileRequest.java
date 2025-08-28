package com.example.dbservice.api.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;

public class CreateProfileRequest {
    public String username;
    public String firstName;
    public String lastName;

    /** Accept "yyyy-MM-dd" */
    @JsonFormat(pattern = "yyyy-MM-dd")
    public LocalDate birthday;

    public String country;
    public String mobile;
    public String email;
    public String password;
}