package tutorgo.com.tutorgo.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tutorgo.com.dto.request.CreateAccountRequest;
import tutorgo.com.exception.PhoneAlredyExistExecption;
import tutorgo.com.mapper.AccountMapper;
import tutorgo.com.repository.AccountRepository;

@Service
@RequiredArgsConstructor
public class AccountService {
    private final AccountRepository accountRepository;
    private final AccountMapper accountMapper;
    // private final AccountFinderService accountFinderService;

    @Transactional
    public void createAccount(CreateAccountRequest request) {
        if(accountRepository.existsByPhoneNumber(request.phoneNumber())){
            throw new PhoneAlredyExistExecption("El numero de celular ya existe");
        }
    }

}