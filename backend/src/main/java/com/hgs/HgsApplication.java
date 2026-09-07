package com.hgs;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class HgsApplication {

	public static void main(String[] args) {
		SpringApplication.run(HgsApplication.class, args);
	}

}
