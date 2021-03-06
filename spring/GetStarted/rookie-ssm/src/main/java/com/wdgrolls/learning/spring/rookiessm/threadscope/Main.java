package com.wdgrolls.learning.spring.rookiessm.threadscope;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class Main {

	public static void main(String[] args) {
		ApplicationContext context = new ClassPathXmlApplicationContext(new String[] {"thread-scope-test.xml"});

		final Foo foo = context.getBean("foo", Foo.class);
		
		Thread t1 = new Thread(new Runnable() {

			@Override
			public void run() {
				Bar bar = foo.getBar();
				bar.setV1(10);
				try {
					Thread.sleep(500);
				} catch (InterruptedException e) {
					e.printStackTrace();
				}
				bar.setV2(20);
				foo.printSumOfBar();
			}
			
		});
		t1.start();
		
		Thread t2 = new Thread(new Runnable() {

			@Override
			public void run() {
				Bar bar = foo.getBar();
				bar.setV1(100);
				bar.setV2(200);
				foo.printSumOfBar();
			}
			
		});
		t2.start();		
	}

}
