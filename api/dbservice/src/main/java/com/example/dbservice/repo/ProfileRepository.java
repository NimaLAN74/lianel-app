package com.example.dbservice.repo;

import com.example.dbservice.model.Profile;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProfileRepository extends MongoRepository<Profile, String> {
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}