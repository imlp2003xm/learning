package com.wdgrolls.learning.spring.rookiessm.autowire;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Bar {

	private Logger log = LoggerFactory.getLogger(getClass());
	
	public void doSometing() {
		log.info("Bar is doing something");
	}
}
