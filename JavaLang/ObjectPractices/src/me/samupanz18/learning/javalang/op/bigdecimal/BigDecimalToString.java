package me.samupanz18.learning.javalang.op.bigdecimal;

import java.math.BigDecimal;

public class BigDecimalToString {

    public static void main(String[] args) {
       BigDecimal value = new BigDecimal(15874).movePointLeft(2);
       System.out.println(String.format("The unscaled value is %1$d", value.unscaledValue()));
       System.out.println(String.format("The value is %1$.2f", value));

       value = new BigDecimal(123).movePointLeft(5);
       System.out.println(String.format("The unscaled value is %1$d", value.unscaledValue()));
       System.out.println(String.format("The value is %1$.2f", value));
       System.out.println(value);
    }

}
