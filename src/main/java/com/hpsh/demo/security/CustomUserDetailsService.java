package com.hpsh.demo.security;

import com.hpsh.demo.dao.UserDao;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserDao userDao;

    public CustomUserDetailsService(UserDao userDao) {
        this.userDao = userDao;
    }

    @Override
    public UserDetails loadUserByUsername(String input) throws UsernameNotFoundException {
        return userDao.findByUsernameOrEmail(input, input)
                .map(SecurityUser::new)
                .orElseThrow(() -> new UsernameNotFoundException(input + " not found."));
    }
}
