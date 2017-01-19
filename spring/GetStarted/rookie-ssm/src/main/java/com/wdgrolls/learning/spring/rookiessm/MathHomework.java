package com.wdgrolls.learning.spring.rookiessm;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class MathHomework {
	
	private static final Logger LOGGER = LoggerFactory.getLogger(MathHomework.class);
	
	public static void main(String[] args) {
		ApplicationContext context = new ClassPathXmlApplicationContext(new String[] {"calculating.xml"});
		
		BasicCalculator bc = context.getBean("basicCalculator", BasicCalculator.class);
		
		int sum = bc.add(1, 2, 3, 4, 5);
		
		LOGGER.info("sum is: " + sum);
	}
	
}
