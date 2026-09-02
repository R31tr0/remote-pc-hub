package com.grapes.remotepchub.pc;

import com.grapes.remotepchub.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface RemotePcRepository extends JpaRepository<RemotePc, Long> {
    List<RemotePc> findByUser(User user);

    @Transactional
    void deleteByIdAndUser(Long id, User user);
}
