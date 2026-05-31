require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Problem = require('./models/Problem');

const problems = [
  {
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return **indices** of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    inputFormat: 'First line: n (size of array)\nSecond line: n space-separated integers\nThird line: target integer',
    outputFormat: 'Two space-separated indices (0-indexed)',
    constraints: '2 ≤ n ≤ 10^4\n-10^9 ≤ nums[i] ≤ 10^9\n-10^9 ≤ target ≤ 10^9',
    examples: [
      { input: '4\n2 7 11 15\n9', output: '0 1', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
      { input: '3\n3 2 4\n6', output: '1 2', explanation: 'nums[1] + nums[2] = 2 + 4 = 6' },
    ],
    testCases: [
      { input: '4\n2 7 11 15\n9', expectedOutput: '0 1', isSample: true },
      { input: '3\n3 2 4\n6', expectedOutput: '1 2', isSample: true },
      { input: '2\n3 3\n6', expectedOutput: '0 1', isSample: false },
      { input: '5\n1 5 3 7 2\n9', expectedOutput: '1 3', isSample: false },
    ],
  },
  {
    title: 'Reverse a String',
    slug: 'reverse-string',
    difficulty: 'Easy',
    tags: ['String', 'Two Pointers'],
    description: `Write a function that reverses a string. 

Given a string \`s\`, output the reversed version of that string.`,
    inputFormat: 'A single line containing the string s',
    outputFormat: 'The reversed string on a single line',
    constraints: '1 ≤ |s| ≤ 10^5',
    examples: [
      { input: 'hello', output: 'olleh', explanation: 'Reversed "hello" is "olleh"' },
      { input: 'abcde', output: 'edcba', explanation: '' },
    ],
    testCases: [
      { input: 'hello', expectedOutput: 'olleh', isSample: true },
      { input: 'abcde', expectedOutput: 'edcba', isSample: true },
      { input: 'racecar', expectedOutput: 'racecar', isSample: false },
      { input: 'OpenAI', expectedOutput: 'IAnepO', isSample: false },
    ],
  },
  {
    title: 'Fibonacci Number',
    slug: 'fibonacci-number',
    difficulty: 'Easy',
    tags: ['Math', 'Dynamic Programming', 'Recursion'],
    description: `The **Fibonacci numbers**, commonly denoted F(n), form a sequence called the Fibonacci sequence, such that each number is the sum of the two preceding ones:

F(0) = 0, F(1) = 1
F(n) = F(n - 1) + F(n - 2), for n > 1

Given \`n\`, calculate F(n).`,
    inputFormat: 'A single integer n',
    outputFormat: 'F(n) on a single line',
    constraints: '0 ≤ n ≤ 30',
    examples: [
      { input: '4', output: '3', explanation: 'F(4) = F(3) + F(2) = 2 + 1 = 3' },
      { input: '10', output: '55', explanation: '' },
    ],
    testCases: [
      { input: '4', expectedOutput: '3', isSample: true },
      { input: '10', expectedOutput: '55', isSample: true },
      { input: '0', expectedOutput: '0', isSample: false },
      { input: '1', expectedOutput: '1', isSample: false },
      { input: '20', expectedOutput: '6765', isSample: false },
    ],
  },
  {
    title: 'Check Palindrome',
    slug: 'check-palindrome',
    difficulty: 'Easy',
    tags: ['String', 'Two Pointers'],
    description: `A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Given a string \`s\`, return \`true\` if it is a palindrome, or \`false\` otherwise.`,
    inputFormat: 'A single line containing the string s',
    outputFormat: '"true" or "false"',
    constraints: '1 ≤ |s| ≤ 2 * 10^5',
    examples: [
      { input: 'racecar', output: 'true', explanation: '"racecar" reads same forwards and backwards' },
      { input: 'hello', output: 'false', explanation: '"hello" reversed is "olleh"' },
    ],
    testCases: [
      { input: 'racecar', expectedOutput: 'true', isSample: true },
      { input: 'hello', expectedOutput: 'false', isSample: true },
      { input: 'madam', expectedOutput: 'true', isSample: false },
      { input: 'abcba', expectedOutput: 'true', isSample: false },
      { input: 'abcd', expectedOutput: 'false', isSample: false },
    ],
  },
  {
    title: 'Maximum Subarray',
    slug: 'maximum-subarray',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming', 'Divide and Conquer'],
    description: `Given an integer array \`nums\`, find the **subarray** with the largest sum, and return its sum.

This is the classic **Kadane's Algorithm** problem.`,
    inputFormat: 'First line: n\nSecond line: n space-separated integers',
    outputFormat: 'The maximum subarray sum',
    constraints: '1 ≤ n ≤ 10^5\n-10^4 ≤ nums[i] ≤ 10^4',
    examples: [
      { input: '9\n-2 1 -3 4 -1 2 1 -5 4', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum = 6' },
      { input: '1\n1', output: '1', explanation: '' },
    ],
    testCases: [
      { input: '9\n-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6', isSample: true },
      { input: '1\n1', expectedOutput: '1', isSample: true },
      { input: '5\n-1 -2 -3 -4 -5', expectedOutput: '-1', isSample: false },
      { input: '4\n1 2 3 4', expectedOutput: '10', isSample: false },
    ],
  },
  {
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    difficulty: 'Easy',
    tags: ['String', 'Stack'],
    description: `Given a string \`s\` containing just the characters \`(\`, \`)\`, \`{\`, \`}\`, \`[\` and \`]\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    inputFormat: 'A single string s',
    outputFormat: '"true" or "false"',
    constraints: '1 ≤ |s| ≤ 10^4',
    examples: [
      { input: '()', output: 'true', explanation: '' },
      { input: '()[]{', output: 'false', explanation: '' },
      { input: '{[()]}', output: 'true', explanation: '' },
    ],
    testCases: [
      { input: '()', expectedOutput: 'true', isSample: true },
      { input: '()[]{', expectedOutput: 'false', isSample: true },
      { input: '{[()]}', expectedOutput: 'true', isSample: true },
      { input: '(]', expectedOutput: 'false', isSample: false },
      { input: '((()))', expectedOutput: 'true', isSample: false },
    ],
  },
  {
    title: 'Binary Search',
    slug: 'binary-search',
    difficulty: 'Easy',
    tags: ['Array', 'Binary Search'],
    description: `Given an array of integers \`nums\` which is **sorted in ascending order**, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, return its index. Otherwise, return \`-1\`.

You must write an algorithm with **O(log n)** runtime complexity.`,
    inputFormat: 'First line: n\nSecond line: n sorted space-separated integers\nThird line: target',
    outputFormat: 'Index of target or -1',
    constraints: '1 ≤ n ≤ 10^4\n-10^4 ≤ nums[i], target ≤ 10^4',
    examples: [
      { input: '6\n-1 0 3 5 9 12\n9', output: '4', explanation: '9 exists in nums and its index is 4' },
      { input: '6\n-1 0 3 5 9 12\n2', output: '-1', explanation: '2 does not exist in nums' },
    ],
    testCases: [
      { input: '6\n-1 0 3 5 9 12\n9', expectedOutput: '4', isSample: true },
      { input: '6\n-1 0 3 5 9 12\n2', expectedOutput: '-1', isSample: true },
      { input: '1\n5\n5', expectedOutput: '0', isSample: false },
      { input: '3\n1 3 5\n3', expectedOutput: '1', isSample: false },
    ],
  },
  {
    title: 'Merge Two Sorted Lists',
    slug: 'merge-sorted-lists',
    difficulty: 'Easy',
    tags: ['Array', 'Two Pointers', 'Sorting'],
    description: `You are given two integer arrays \`nums1\` and \`nums2\`, sorted in **non-decreasing order**.

Merge the two arrays into a single sorted array and output it.`,
    inputFormat: 'First line: n (size of nums1)\nSecond line: n space-separated integers\nThird line: m (size of nums2)\nFourth line: m space-separated integers',
    outputFormat: 'Merged sorted array, space-separated',
    constraints: '0 ≤ n, m ≤ 10^4\n-10^9 ≤ nums[i] ≤ 10^9',
    examples: [
      { input: '3\n1 2 4\n3\n1 3 5', output: '1 1 2 3 4 5', explanation: '' },
    ],
    testCases: [
      { input: '3\n1 2 4\n3\n1 3 5', expectedOutput: '1 1 2 3 4 5', isSample: true },
      { input: '2\n1 3\n2\n2 4', expectedOutput: '1 2 3 4', isSample: false },
      { input: '0\n\n3\n1 2 3', expectedOutput: '1 2 3', isSample: false },
    ],
  },
  {
    title: 'Count Distinct Elements',
    slug: 'count-distinct',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    description: `Given an array of integers, return the number of **distinct** (unique) elements in the array.`,
    inputFormat: 'First line: n\nSecond line: n space-separated integers',
    outputFormat: 'A single integer — the count of distinct elements',
    constraints: '1 ≤ n ≤ 10^5\n-10^9 ≤ nums[i] ≤ 10^9',
    examples: [
      { input: '6\n1 2 2 3 3 3', output: '3', explanation: 'Distinct elements are {1, 2, 3}' },
      { input: '4\n5 5 5 5', output: '1', explanation: '' },
    ],
    testCases: [
      { input: '6\n1 2 2 3 3 3', expectedOutput: '3', isSample: true },
      { input: '4\n5 5 5 5', expectedOutput: '1', isSample: true },
      { input: '5\n1 2 3 4 5', expectedOutput: '5', isSample: false },
      { input: '3\n-1 0 1', expectedOutput: '3', isSample: false },
    ],
  },
  {
    title: 'Longest Common Subsequence',
    slug: 'longest-common-subsequence',
    difficulty: 'Hard',
    tags: ['String', 'Dynamic Programming'],
    description: `Given two strings \`text1\` and \`text2\`, return the **length of their longest common subsequence**. If there is no common subsequence, return \`0\`.

A **subsequence** of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters.

For example, \`"ace"\` is a subsequence of \`"abcde"\`.

A **common subsequence** of two strings is a subsequence that is common to both strings.`,
    inputFormat: 'First line: text1\nSecond line: text2',
    outputFormat: 'Length of longest common subsequence',
    constraints: '1 ≤ |text1|, |text2| ≤ 1000\nStrings consist of lowercase English characters only',
    examples: [
      { input: 'abcde\nace', output: '3', explanation: 'The LCS is "ace", which has length 3' },
      { input: 'abc\nabc', output: '3', explanation: 'The LCS is "abc", which has length 3' },
      { input: 'abc\ndef', output: '0', explanation: 'There is no common subsequence' },
    ],
    testCases: [
      { input: 'abcde\nace', expectedOutput: '3', isSample: true },
      { input: 'abc\nabc', expectedOutput: '3', isSample: true },
      { input: 'abc\ndef', expectedOutput: '0', isSample: false },
      { input: 'bsbininm\njmjkbkjkv', expectedOutput: '1', isSample: false },
    ],
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Problem.deleteMany({});
    await User.deleteMany({});

    // Create admin user
    const admin = await User.create({
      username: 'admin',
      email: 'admin@codejudge.io',
      password: 'admin123',
      role: 'admin',
    });
    console.log('✅ Admin user created (email: admin@codejudge.io, password: admin123)');

    // Create sample users
    const users = await User.insertMany([
      { username: 'alice_dev', email: 'alice@example.com', password: await bcrypt.hash('password123', 10), score: 120, totalSubmissions: 30 },
      { username: 'bob_coder', email: 'bob@example.com', password: await bcrypt.hash('password123', 10), score: 90, totalSubmissions: 20 },
      { username: 'charlie_ace', email: 'charlie@example.com', password: await bcrypt.hash('password123', 10), score: 60, totalSubmissions: 15 },
    ]);
    console.log('✅ Sample users created');

    // Create problems
    const createdProblems = await Problem.insertMany(problems.map(p => ({ ...p, createdBy: admin._id })));
    console.log(`✅ ${createdProblems.length} problems seeded`);

    // Give sample users some solved problems
    await User.findByIdAndUpdate(users[0]._id, {
      solvedProblems: createdProblems.slice(0, 6).map(p => p._id),
    });
    await User.findByIdAndUpdate(users[1]._id, {
      solvedProblems: createdProblems.slice(0, 4).map(p => p._id),
    });
    await User.findByIdAndUpdate(users[2]._id, {
      solvedProblems: createdProblems.slice(0, 2).map(p => p._id),
    });

    console.log('🎉 Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
