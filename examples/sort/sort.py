def sort(nums):
  if len(nums) <= 1:
    return nums

  pivot = nums[0]
  left = sort([n for n in nums if n < pivot])
  middle = [n for n in nums if n == pivot]
  right = sort([n for n in nums if n >= pivot])
  return left + [pivot] + right

print(sort([3, 1, 4, 1, 5, 9, 2, 6, 5, 4]))
