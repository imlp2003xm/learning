package com.wdgrolls.learning.spring.rookiessm;


public class BasicCalculator {

	public int add(int... values) {
		int result = 0;
		
		for (int value : values) {
			result += value;
		}
		
		return result;
	}
}
