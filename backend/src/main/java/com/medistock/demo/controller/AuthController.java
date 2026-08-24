package com.medistock.demo.controller;

import com.medistock.demo.dto.AuthResponse;
import com.medistock.demo.dto.LoginRequest;
import com.medistock.demo.dto.RegisterRequest;
import com.medistock.demo.dto.OtpRequest;
import com.medistock.demo.dto.OtpVerifyRequest;
import com.medistock.demo.dto.ForgotPasswordRequest;

import com.medistock.demo.entity.User;

import com.medistock.demo.repository.UserRepository;

import com.medistock.demo.service.AuthService;
import com.medistock.demo.service.OtpService;
import com.medistock.demo.service.JwtService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    private final OtpService otpService;

    private final UserRepository userRepository;

    private final JwtService jwtService;





    public AuthController(

            AuthService authService,

            OtpService otpService,

            UserRepository userRepository,

            JwtService jwtService

    ){

        this.authService = authService;

        this.otpService = otpService;

        this.userRepository = userRepository;

        this.jwtService = jwtService;

    }








    // ================= REGISTER =================



    @PostMapping("/register")

    public ResponseEntity<AuthResponse> register(

            @RequestBody RegisterRequest request

    ){


        return ResponseEntity.ok(

                authService.register(request)

        );


    }









    // ================= LOGIN =================



    @PostMapping("/login")

    public ResponseEntity<AuthResponse> login(

            @RequestBody LoginRequest request

    ){


        return ResponseEntity.ok(

                authService.login(request)

        );


    }









    // ================= SEND OTP =================



    @PostMapping("/send-otp")

    public ResponseEntity<String> sendOtp(

            @RequestBody OtpRequest request

    ){



        User user = userRepository

                .findByPhone(request.getPhone())

                .orElseThrow(() ->

                        new RuntimeException(
                                "User not found"
                        )

                );





        if(user.getPhone()==null ||

                user.getPhone().isBlank()){


            return ResponseEntity

                    .badRequest()

                    .body(
                            "Mobile number not registered"
                    );


        }






        otpService.generateOtp(

                user.getPhone()

        );





        return ResponseEntity.ok(

                "OTP sent successfully"

        );



    }









    // ================= VERIFY OTP =================



    @PostMapping("/verify-otp")

    public ResponseEntity<AuthResponse> verifyOtp(

            @RequestBody OtpVerifyRequest request

    ){



        boolean valid = otpService.verifyOtp(

                request.getPhone(),

                request.getOtp()

        );





        if(!valid){


            throw new RuntimeException(

                    "Invalid OTP"

            );


        }








        User user = userRepository

                .findByPhone(request.getPhone())

                .orElseThrow(() ->

                        new RuntimeException(
                                "User not found"
                        )

                );







        String role = user.getRole().toUpperCase();







        String token = jwtService.generateToken(

                user.getEmail(),

                role

        );







        otpService.clearOtp(

                request.getPhone()

        );









        return ResponseEntity.ok(

                new AuthResponse(

                        token,

                        role,

                        user.getId()

                )

        );
        



    }

// ================= FORGOT PASSWORD =================

@PostMapping("/forgot-password")
public ResponseEntity<String> forgotPassword(
        @RequestBody ForgotPasswordRequest request
) {

    authService.forgotPassword(request.getEmail());

    return ResponseEntity.ok(
            "New password has been sent to your email"
    );
}

}