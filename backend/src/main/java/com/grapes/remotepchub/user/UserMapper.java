package com.grapes.remotepchub.user;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDto toDto(User user);

    @Mapping(target = "name", source = "username")
    User toEntity(RegisterUserRequest request);
}
