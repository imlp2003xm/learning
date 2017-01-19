package com.wdgrolls.learning.spring.rookiessm.autowire;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Foo {

	private Logger log = LoggerFactory.getLogger(getClass());
	
	private Bar bar;

	public Bar getBar() {
		return bar;
	}

	public void setBar(Bar bar) {
		this.bar = bar;
	}
	
	public void doSomething() {
		log.info("Foo is asking Bar to do something...");
		bar.doSometing();
	}
}
