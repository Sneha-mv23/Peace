import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';

const mockUser = {
  _id: 'user123',
  name: 'John Smith',
  email: 'john@embassy.gov',
  country: 'United States',
  role: 'diplomat',
  preferred_language: 'en',
  isActive: true,
  save: jest.fn().mockResolvedValue(this),
};

const mockUserModel = {
  new: jest.fn().mockResolvedValue(mockUser),
  constructor: jest.fn().mockResolvedValue(mockUser),
  find: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  create: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw ConflictException if email exists', async () => {
    mockUserModel.findOne.mockResolvedValueOnce(mockUser);
    await expect(
      service.create({ name: 'Test', email: 'john@embassy.gov', password: 'pass', country: 'US' })
    ).rejects.toThrow(ConflictException);
  });

  it('should throw NotFoundException if user not found', async () => {
    mockUserModel.findById.mockReturnValueOnce({ select: () => ({ exec: () => null }) });
    await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
  });
});