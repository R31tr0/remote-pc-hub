package com.grapes.remotepchub.pc;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RemotePcMapper {
    RemotePcDto toDto(RemotePc remotePc);

    List<RemotePcDto> toDto(List<RemotePc> remotePcs);
}
