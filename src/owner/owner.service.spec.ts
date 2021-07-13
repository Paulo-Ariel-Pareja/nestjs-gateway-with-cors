import { Test, TestingModule } from '@nestjs/testing';
import { OwnerService } from './owner.service';
import { getModelToken } from '@nestjs/mongoose';

describe('OwnerService', () => {
  let service: OwnerService;

  const findOneEvent = {
    _id: '53d53d2s',
    uuid: '1',
    messages: [],
  };
  const aggregateEvent = {
    "_id": "60e2a0b541256e3674347199",
    "message": "nuevo2",
    "createdAt": "2021-07-05T06:03:33.776Z"
  }
  const deleteEvent = {
    "_id": "60e3cb94f6c6040020733d23",
    "uuid": "sarasa",
    "messages": [
      {
        "_id": "60e3cb94f6c6040020733d24",
        "message": "nuevo2",
        "createdAt": "2021-07-06T03:18:44.292Z"
      }
    ],
    "createdAt": "2021-07-06T03:18:44.293Z",
    "__v": 0
  }
  const OwnerModel = {
    save: jest.fn().mockResolvedValue(deleteEvent),
    findOne: jest.fn().mockResolvedValue(findOneEvent),
    aggregate: jest.fn().mockResolvedValue(aggregateEvent),
    findOneAndUpdate: jest.fn().mockResolvedValue(deleteEvent),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OwnerService,
        {
          provide: getModelToken('Owner'),
          useValue: OwnerModel,
        },
      ],
    }).compile();

    service = module.get<OwnerService>(OwnerService);

  });

  it('should return all messages for owner', () => {
    expect(service.getMessagesActive('1')).resolves.toEqual(findOneEvent).catch(err => {
      console.log(err);
    });
  });

  it('remove one message for owner', () => {
    expect(service.removeMessage('1', '60e2a0b541256e3674347199')).resolves.toEqual(deleteEvent).catch(err => {
      console.log(err);
    });
  });

  it('should return all messages for owner', () => {
    expect(service.getOneMessage('1', '60e2a0b541256e3674347199')).resolves.toEqual(aggregateEvent).catch(err => {
      console.log(err);
    });
  });

  // to do: test create method for service
  // option 1
/*   it('should return new owner', () => {
    const body = {
      "uuid": "sarasa",
      "messages": [
        { "message": "nuevo2" }
      ]
    };
    expect(service.create(body as OwnerDto)).resolves.toEqual(deleteEvent).catch(err => {
      console.log(err);
    });
  }); */

  // option 2
  /* 
  it('should return new owner', () => {
    const mockResult = {
      "_id": "60e3cb94f6c6040020733d23",
      "uuid": "sarasa",
      "messages": [
        {
          "_id": "60e3cb94f6c6040020733d24",
          "message": "nuevo2",
          "createdAt": "2021-07-06T03:18:44.292Z"
        }
      ],
      "createdAt": "2021-07-06T03:18:44.293Z",
      "__v": 0
    }
    const body = {
      "uuid": "sarasa",
      "messages": [
        { "message": "nuevo2" }
      ]
    };
    jest.spyOn(Owner.prototype, 'save')
      .mockImplementation(async () => mockResult as Promise<Owner>);
    expect(service.create(body as OwnerDto)).resolves.toEqual(deleteEvent).catch(err => {
      console.log(err);
    });
  }); */
});