package com.wdgrolls.learning.spring.rookiessm.autowire;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class Main {

	public static void main(String[] args) {
		ApplicationContext context = new ClassPathXmlApplicationContext(new String[] {"autowire-test.xml"});
		
		Foo foo = context.getBean("foo", Foo.class);
		foo.doSomething();

	}

}
