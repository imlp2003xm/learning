package com.wdgrolls.learning.spring.rookiessm;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class FullNameMain {

	private static final Logger LOG = LoggerFactory.getLogger(FullNameMain.class);
	
	public static void main(String[] args) {
		ApplicationContext context = new ClassPathXmlApplicationContext(new String[] {"di-test.xml"});
		
		FullName myFullName = context.getBean("myFullName", FullName.class);
		
		LOG.info("hello, " + myFullName);
	}

}
