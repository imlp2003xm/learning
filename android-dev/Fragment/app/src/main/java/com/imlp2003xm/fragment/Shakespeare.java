package com.imlp2003xm.fragment;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by samuel.gong on 2015/11/5.
 */
public class Shakespeare {

    public static final List<String> TITLES = new ArrayList<>();

    public static final String[] DIALOGUE = new String[5];

    static {
        TITLES.add("All's Well That Ends Well ");
        TITLES.add("As You Like It ");
        TITLES.add("The Comedy of Errors ");
        TITLES.add("Cymbeline");
        TITLES.add("Love's Labours Lost ");

        DIALOGUE[0] = "All's Well That Ends Well is a play by William Shakespeare. It is believed to have been written between 1604 and 1605,[1][2] and was originally published in the First Folio in 1623.";
        DIALOGUE[1] = "As You Like It is a pastoral comedy by William Shakespeare believed to have been written in 1599 and first published in the First Folio, 1623.";
        DIALOGUE[2] = "It is his shortest and one of his most farcical comedies, with a major part of the humour coming from slapstick and mistaken identity, in addition to puns and word play. ";
        DIALOGUE[3] = "Cymbeline /ˈsɪmbɨliːn/, also known as Cymbeline, King of Britain, is a play by William Shakespeare, set in Ancient Britain and based on legends that formed part of the Matter of Britain concerning the early Celtic British King Cunobeline. ";
        DIALOGUE[4] = "Love's Labour's Lost is one of William Shakespeare's early comedies, believed to have been written in the mid-1590s for a performance at the Inns of Court before Queen Elizabeth I.";
    }
}
