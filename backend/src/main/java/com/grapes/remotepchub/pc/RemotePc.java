package com.grapes.remotepchub.pc;

import com.grapes.remotepchub.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class RemotePc {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String alias;
    private String host;
    private int port;
    private String username;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
